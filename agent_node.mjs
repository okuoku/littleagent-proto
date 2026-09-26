import { agent, ndJsonStream } from '@agentclientprotocol/sdk';
import { Readable, Writable } from 'node:stream';
import { randomUUID } from 'node:crypto';

async function main(){
    const app = agent({name: "LittleAgent"});
    const stream = ndJsonStream(Writable.toWeb(process.stdout), 
                                Readable.toWeb(process.stdin));

    async function cb_connect(connection){
        // connection is AgentConnection
        // https://agentclientprotocol.github.io/typescript-sdk/interfaces/AgentConnection.html
    }

    // RequestHandlers
    // https://agentclientprotocol.github.io/typescript-sdk/types/AgentRequestHandlersByMethod.html

    async function cb_initialize(req){
        // req: AgentRequestContext
        // https://agentclientprotocol.github.io/typescript-sdk/types/AgentRequestContext.html
        // req.params: InitializeRequest
        // https://agentclientprotocol.github.io/typescript-sdk/types/InitializeRequest.html
        const res = {
            // https://agentclientprotocol.github.io/typescript-sdk/types/InitializeResponse.html
            protocolVersion: 1,
            agentCapabilities: {}
            // FIXME: agentInfo
        };
        return res;
    }

    async function cb_session_new(req){
        // req.params: NewSessionRequest
        // https://agentclientprotocol.github.io/typescript-sdk/types/NewSessionRequest.html
        const res = {
            // https://agentclientprotocol.github.io/typescript-sdk/types/NewSessionResponse.html
            sessionId: randomUUID()
        };
        return res;
    }

    async function cb_session_prompt(req){
        // req.params: PromptRequest
        // https://agentclientprotocol.github.io/typescript-sdk/types/PromptRequest.html

        // Collect texts from ContentBlock[]
        const input = req.params.prompt.map((e) => (e.type == "text" ? e.text : "")).join("");

        // Output echo
        await req.client.notify("session/update", {
            sessionId: req.params.sessionId,
            update: {
                sessionUpdate: "agent_message_chunk",
                content: {
                    type: "text",
                    text: "ECHO:" + input
                }
            }
        });

        const res = {
            // https://agentclientprotocol.github.io/typescript-sdk/types/PromptResponse.html
            stopReason: "end_turn"
        }
        return res;
    }

    app.onConnect(cb_connect);
    app.onRequest("initialize", cb_initialize);
    app.onRequest("session/new", cb_session_new);
    app.onRequest("session/prompt", cb_session_prompt);
    app.connect(stream);


}

await main();
