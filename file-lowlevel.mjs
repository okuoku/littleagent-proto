import { Bash, MountableFs, InMemoryFs } from "just-bash";

export async function new_ctx(){
    /* Bash context */
    const fs = new MountableFs({base: new InMemoryFs()});
    const env = new Bash({ fs });

    /* FIXME: Mount filesystems here */

    /* Init */
    await env.exec("mkdir -p /agent_temp");

    return {
        bash: env,
        edit_serial: 0
    };
}

export async function start_edit(ctx){ // => edit_ctx
    /* Init */
    ctx.edit_serial++;
    return {
        ctx: ctx,
        temp_path: `/agent_temp/edit_${ctx.edit_serial}`,
        current_serial: 0
    }
}

export async function end_edit(edit_ctx){
    await edit_ctx.ctx.bash.exec(`rm -rf ${edit_ctx.temp_path}`);
    edit_ctx.term = true;
}

export function test_ended_edit(edit_ctx){
    if(edit_ctx.term !== true){
        throw Error("In flight edit");
    }
}

export function get_temporary_file_name(edit_ctx){
    edit_ctx.current_serial++;
    return `${edit_ctx.temp_path}/t_${edit_ctx.current_serial}.txt` 
}

export async function create_temporary_file(edit_ctx, lines){
    const temp_path = get_temporary_file_name(edit_ctx);
    const str = lines.join("\n") + "\n";

    let delim = "EOF";
    while(lines.includes(delim)){
        delim += "_";
    }
    const script = `cat > ${temp_path} <<${delim}\n${str}${delim}\n`
    const res = await edit_ctx.ctx.bash.exec(script, {rawScript: true});
    if(res.exitCode != 0){
        throw Error("failed to write file");
    }
    return temp_path;
}

export async function call_bash(ctx, script){
    const res = await ctx.bash.exec(script);
    return {
        stdout: res.stdout,
        stderr: res.stderr,
        code: res.exitCode
    }
}

