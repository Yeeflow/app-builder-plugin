import test from "node:test";
import { createRequire } from "node:module";
const { validateDecodedDef } = createRequire(import.meta.url)("../validate-ywf-def.js");
import expressions from "./lib/workflow-assignee-expression-utils.cjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { materializeFullAppGeneratedFinal, buildApprovalWorkflowShapes } from "./materialize-full-app-generated-final.mjs";
import { planningIdentity, applyPlannedFieldConstraints } from "./lib/planned-field-constraints.mjs";
import { validateGeneratedPlanConformance } from "./lib/generated-plan-conformance.mjs";

test("Unicode identities keep distinct named resources and normalize canonical accents", () => {
  assert.notEqual(planningIdentity("Project approval"), planningIdentity("Finance approval"));
  assert.equal(planningIdentity("Order-Lines"), "order lines");
  assert.equal(planningIdentity("café"), planningIdentity("cafe\u0301"));
});

test("full generation preserves named lists, more than 16 fields and explicit native constraints", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "schema-repair-test-"));
  try {
    fs.writeFileSync(path.join(cwd, "functional-specification.md"), "# Resource constraint regression\nFour independent test lists with required unique codes and default enabled flags.\n");
    const names = ["Projects", "Suppliers", "Execution register", "Deliveries"];
    const blocks = names.map((name, i) => `### 4.${i + 1} ${name}\n\n| Display Name | Internal ID / Field Key | Exact Yeeflow Field Type | Exact Yeeflow Control Type | Required | Unique | Default Value |\n| --- | --- | --- | --- | --- | --- | --- |\n| Code | Code | Text | input | Yes | Yes | |\n| Active | Active | Bit | switch | Yes | No | true |\n| Budget | Budget | Currency | currency | Yes | No | 0 |\n${Array.from({length: 18}, (_, n) => `| Field${n} | Extra${n} | Text | input | No | No | |`).join("\n")}\n`);
    const forms = names.map((name, i) => `### 10.${i+1} ${name}

| Data List or Library | Custom Form | Form Usage | Selected Data List Form Layout Template |
| --- | --- | --- | --- |
| ${name} | ${name} New/Edit | New/Edit | data_list_form_layout_new_edit_v1_1 |
| ${name} | ${name} View | View | data_list_form_layout_view_item_v1_1 |
`).join("\n");
    fs.writeFileSync(path.join(cwd, "yeeflow-app-plan.md"), `# Regression\nApplication icon selection: fa-solid fa-flask\nBusiness defaults approval status: user-default-approved-for-generation.\n\n## 4. Data Lists and Document Libraries Plan\n\n${blocks.join("\n")}\n## 10. Custom Data List Forms Plan\n\n${forms}`);
    const result = materializeFullAppGeneratedFinal({ cwd, allowFixtureApiIdsForTests: true });
    assert.equal(result.status, "pass", JSON.stringify(result.findings));
    const decoded = JSON.parse(fs.readFileSync(result.outputs.decodedResource, "utf8"));
    assert.deepEqual(decoded.Childs.map(c => c.List.Title), names);
    for (const child of decoded.Childs) {
      assert.equal(child.Fields.length, 22);
      const field = name => child.Fields.find(f => f.DisplayName === name);
      assert.equal(field("Code").IsUnique, true);
      assert.equal(JSON.parse(field("Code").Rules).required, true);
      assert.equal(field("Active").DefaultValue, "1");
      assert.equal(field("Budget").Type, "currency");
      assert.equal(field("Budget").DefaultValue, "0");
    }
  } finally { fs.rmSync(cwd, { recursive: true, force: true }); }
});

test("field defaults fail closed for invalid native values and preserve existing rules", () => {
  const record = () => ({ FieldType: "Bit", Rules: '{"placeholder":"Preserved"}', DefaultValue: "1" });
  assert.equal(applyPlannedFieldConstraints(record(), { defaultValue: false }).DefaultValue, "0");
  assert.equal(JSON.parse(applyPlannedFieldConstraints(record(), {required:true}).Rules).placeholder, "Preserved");
  assert.throws(() => applyPlannedFieldConstraints(record(), {defaultValue:"maybe"}), /BOOLEAN_INVALID/);
});

const graph = (steps, dataListMetas = []) => buildApprovalWorkflowShapes({ defId:"100", formKey:"test", rootListSetId:"200", submissionPageId:"submit", taskPageId:"task", startId:"start", endId:"end", rejectEndId:"reject", workflowSteps:steps, dataListMetas });
const condition = op => [{ key:op === ">" ? "00000000-0000-4000-8000-000000000001" : "00000000-0000-4000-8000-000000000002", pre:"and", group:"number", left:expressions.buildWorkflowExpressionButton({type:"variable",param:{id:"Total"}},"Workflow Variables:Total"), op:`n.${op}`, right:{type:0,value:1000} }];

test("gateway emits both planned conditional targets and keeps distinct named review nodes", () => {
  const shapes = graph([
    {nodeName:"Project approval",nodeType:"MultiAssignmentTask"},
    {nodeName:"Amount branch",nodeType:"InclusiveGateway",branches:[{name:"High",target:"Finance approval",conditioninfo:condition(">")},{name:"Low",target:"End",conditioninfo:condition("<=")}]},
    {nodeName:"Finance approval",nodeType:"MultiAssignmentTask"},
  ]);
  const gateway = shapes.find(s => s.stencil.id === "InclusiveGateway");
  const outgoing = shapes.filter(s => s.stencil.id === "SequenceFlow" && s.source?.resourceid === gateway.id);
  assert.equal(gateway.outgoing.length, 2);
  assert.equal(outgoing.length, 2);
  assert.deepEqual(outgoing.map(s => s.properties.conditioninfo), [condition(">"), condition("<=")]);
  assert.ok(outgoing.some(s => s.target.resourceid === "end"));
});

test("unsupported nodes and underspecified gateways and loops cannot silently succeed", () => {
  assert.throws(() => graph([{nodeName:"Bad",nodeType:"UnknownTask"}]), /NODE_TYPE_UNSUPPORTED/);
  assert.throws(() => graph([{nodeName:"Branch",nodeType:"InclusiveGateway"}]), /BRANCHES_REQUIRED/);
  assert.throws(() => graph([{nodeName:"Each",nodeType:"Loop"}]), /LOOP_PLAN_REQUIRED/);
  assert.throws(() => graph([{nodeName:"Branch",nodeType:"InclusiveGateway",branches:[{target:"Missing",conditioninfo:condition(">")},{target:"End",conditioninfo:condition("<=")}]}]), /TARGET_UNRESOLVED/);
});

test("approval loop reuses native Loop, LoopBody and pure edge with an actual write action", () => {
  const shapes = graph([{ nodeName:"Write each row", nodeType:"Loop",
    loopRecord:{nodeName:"Write each row", mode:"list", sourceParent:"__variables_", source:"Lines"},
    loopActions:[{nodeName:"Save details", parentLoop:"Write each row", targetMode:"select", targetResource:"Details", operation:"add", mappings:[{Columns:"Title",TargetType:"Text",Data:[{type:"str",value:"Synthetic"}]}]}],
  }], [{listName:"Details",listId:"300",fields:[{FieldName:"Title",FieldType:"Text"}]}]);
  const loop = shapes.find(s => s.stencil.id === "Loop");
  const body = shapes.find(s => s.stencil.id === "LoopBody");
  const pure = shapes.find(s => s.pureEdge);
  assert.ok(loop && body && pure);
  assert.equal(loop.bodyRef, body.id);
  assert.equal(pure.source.resourceid, loop.id);
  assert.equal(pure.target.resourceid, body.id);
  assert.equal(loop.outgoing.length, 2);
  assert.equal(body.children[0].stencil.id, "ContentList");
  assert.equal(body.children[0].properties.listid, "300");
  const entry = body.children.find(s => s.stencil.id === "SequenceFlow" && s.source?.port === "start");
  assert.ok(entry, "native LoopBody requires a start-port entry line");
  assert.equal(entry.source.resourceid, body.id);
  assert.equal(entry.target.resourceid, body.children[0].id);
  assert.equal(body.children[0].incoming[0].resourceid, entry.id);
  assert.equal(body.outgoing[0].resourceid, entry.id);
  assert.equal(shapes.filter(s => s.stencil.id === "MultiAssignmentTask").length, 0);
});

test("conformance independently rejects dropped fields and altered constraints", () => {
  const demand = { dataListFieldSpecs: { "suppliers": [{displayName:"Code",controlType:"input",unique:true,required:true},{displayName:"Active",controlType:"switch",defaultValue:"true"}] } };
  const decoded = {Childs:[{List:{Title:"Suppliers"},Fields:[{DisplayName:"Code",Type:"input",IsUnique:false,Rules:'{"required":false}'}]}]};
  assert.deepEqual(validateGeneratedPlanConformance(decoded,demand).map(f=>f.code), ["PLAN_CONFORMANCE_FIELD_REQUIRED","PLAN_CONFORMANCE_FIELD_UNIQUE","PLAN_CONFORMANCE_FIELD_MISSING_OR_AMBIGUOUS"]);
  assert.equal(validateGeneratedPlanConformance({Childs:[]},demand)[0].code,"PLAN_CONFORMANCE_LIST_MISSING_OR_AMBIGUOUS");
});

test("conditions must conform to the pinned product schema", () => {
  const branches = [{target:"End",conditioninfo:[{key:"invalid",left:[],op:">",right:[]}]},{target:"End",conditioninfo:condition("<=")}];
  assert.throws(()=>graph([{nodeName:"Amount",nodeType:"InclusiveGateway",branches}]),/CONDITION_INVALID/);
  assert.throws(()=>graph([{nodeName:"Amount",nodeType:"ExclusiveGateway",branches}]),/NODE_TYPE_UNSUPPORTED/);
});


test("final validator accepts native numeric expressions and rejects missing or text variables", () => {
  const shapes = graph([{nodeName:"Amount branch",nodeType:"InclusiveGateway",branches:[{target:"End",conditioninfo:condition(">")},{target:"End",conditioninfo:condition("<=")}]}]);
  const check = type => validateDecodedDef({key:"numeric-test",defkey:"numeric-test",workflowType:2,variables:{basic:type ? [{id:"Total",name:"Total",type}] : [],listref:[],filter:[]},childshapes:shapes,pageurls:[]},{mode:"final"}).errors.filter(e=>e.code==="NUMERIC_CONDITION_BAD_LEFT");
  assert.equal(check("number").length,0);
  assert.equal(check("text").length,2);
  assert.equal(check(null).length,2);
});

test("Approval JSON sublist row schemas preserve exact field IDs and types", async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "approval-json-sublist-"));
  try {
    const fields = [{id:"ItemName",idx:"ItemName",displayName:"Item name",fieldType:"Text",controlType:"input",editable:true},{id:"Quantity",idx:"Quantity",displayName:"Quantity",fieldType:"Number",controlType:"input_number",editable:true},{id:"UnitPrice",idx:"UnitPrice",displayName:"Unit price",fieldType:"Number",controlType:"input_number",editable:true}];
    fs.writeFileSync(path.join(cwd,"functional-specification.md"),"# Typed sublist regression\n");
    fs.writeFileSync(path.join(cwd,"yeeflow-app-plan.md"),`# Typed rows\nApplication icon selection: fa-solid fa-flask\nBusiness defaults approval status: user-default-approved-for-generation.\n\n## 5. Approval Forms Plan\n\n### 5.1 Typed rows\n\n#### Submission Form Fields\n| Business Label | Field Name | Exact Yeeflow Variable Type | Exact Yeeflow Control Type | Required | Sub List Row Fields |\n| --- | --- | --- | --- | --- | --- |\n| Rows | Lines | List | sublist | Yes | \`${JSON.stringify(fields)}\` |\n\n#### Approval Form Layout Template Selection\n| Approval Form | Form Page | Page Role | Selected Approval Form Layout Template |\n| --- | --- | --- | --- |\n| Typed rows | Submission form | Submission | approval_form_layout_submission_v1_1 |\n| Typed rows | Task form | Task | approval_form_layout_task_v1_1 |\n`);
    fs.appendFileSync(path.join(cwd,"yeeflow-app-plan.md"),"\n## 10. Custom Data List Forms Plan\n\n### 10.1 Typed rows Records\n\n| Data List or Library | Custom Form | Form Usage | Selected Data List Form Layout Template |\n| --- | --- | --- | --- |\n| Typed rows Records | Records New/Edit | New/Edit | data_list_form_layout_new_edit_v1_1 |\n| Typed rows Records | Records View | View | data_list_form_layout_view_item_v1_1 |\n");
    const planPath=path.join(cwd,"yeeflow-app-plan.md");
    fs.writeFileSync(planPath,fs.readFileSync(planPath,"utf8").replace("## 5. Approval Forms Plan","## 4. Data Lists and Document Libraries Plan\n\n### 4.1 Typed rows Records\n\n| Display Name | Internal ID / Field Key | Exact Yeeflow Field Type | Exact Yeeflow Control Type |\n| --- | --- | --- | --- |\n| Name | Title | Text | input |\n\n## 5. Approval Forms Plan"));
    const report=materializeFullAppGeneratedFinal({cwd,allowFixtureApiIdsForTests:true});
    assert.equal(report.status,"pass",JSON.stringify(report.findings));
    const resource=JSON.parse(fs.readFileSync(report.outputs.decodedResource,"utf8"));
    const zlib=await import("node:zlib");
    const def=JSON.parse(zlib.brotliDecompressSync(Buffer.from(resource.Forms[0].DefResource,"base64").subarray(10)));
    const controls=[];const visit=v=>{if(!v||typeof v!=="object")return;if(v.binding==="Lines"&&v.type==="list")controls.push(v);Object.values(v).forEach(visit);};visit(def.pageurls);
    assert.equal(controls.length,2);assert.ok(controls.every(c=>c.attrs.required===true));
    assert.deepEqual(def.variables.listref[0].fields.map(f=>[f.id,f.idx,f.type]),[["ItemName","ItemName","text"],["Quantity","Quantity","number"],["UnitPrice","UnitPrice","number"]]);
  } finally {fs.rmSync(cwd,{recursive:true,force:true});}
});
