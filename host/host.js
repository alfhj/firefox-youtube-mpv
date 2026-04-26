const { spawn } = require('child_process');

let payloadSize = null;
let chunks = [];

process.stdin.on('data', chunk => {
    chunks.push(chunk);
    let buffer = Buffer.concat(chunks);

    if (payloadSize === null && buffer.length >= 4) {
        payloadSize = buffer.readUInt32LE(0);
    }

    if (payloadSize !== null && buffer.length >= 4 + payloadSize) {
        const msgString = buffer.toString('utf8', 4, 4 + payloadSize);
        try {
            const msg = JSON.parse(msgString);
            if (msg.url) {
                // By adding /wait, cmd.exe will stay alive until mpv.exe finishes playing the video.
                const launcher = spawn('cmd.exe', ['/c', 'start', '/wait', '""', 'mpv.exe', msg.url], {
                    detached: true,
                    windowsHide: true,
                    stdio: 'ignore'
                });
                
                // When mpv finishes, cmd.exe exits, triggering this callback, which shuts down Node cleanly.
                launcher.on('exit', () => process.exit(0));

                launcher.unref();
                sendMessage({ status: "success", launchedUrl: msg.url });
            } else {
                sendMessage({ error: "No URL provided" });
            }
        } catch (e) {
            sendMessage({ error: e.toString() });
        }
    }
});

function sendMessage(msg) {
    const jsonStr = JSON.stringify(msg);
    const buf = Buffer.from(jsonStr, 'utf8');
    const header = Buffer.alloc(4);
    header.writeUInt32LE(buf.length, 0);
    process.stdout.write(header);
    process.stdout.write(buf);
}
