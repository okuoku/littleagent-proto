import {new_ctx, start_edit, end_edit, 
    create_temporary_file, call_bash, 
    test_ended_edit } from "./file-lowlevel.mjs";

const ctx = await new_ctx();

const ectx = await start_edit(ctx);

const fn0 = await create_temporary_file(ectx, ["line1", "line2", "line3"]);
const fn1 = await create_temporary_file(ectx, ["line4", "line5"]);

/* Create /tmp/out.txt */
const res = await call_bash(ctx, "cat " + fn0 + " " + fn1 + " > /tmp/out.txt");

/* Check /tmp/out.txt content */
const t = await call_bash(ctx, "cat /tmp/out.txt");
console.log(t.stdout);

/* Dispose edit context */
await end_edit(ectx);

test_ended_edit(ectx); // => No error

/* Get last two lines of out.txt */
const n = await call_bash(ctx, "tail -2 /tmp/out.txt");
if(n.code !== 0){
    throw Error("Unexpected");
}
const lines = n.stdout.split("\n");
lines.pop(); // Remove the last entry because the file always ends with \n
console.log(lines);
