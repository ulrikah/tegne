import paper from "paper";

let waveform: Array<paper.Point> = [];
let startX: number, endX: number;
const sampleRate = 22050;
let audioCtx: AudioContext;
let audioSource: AudioBufferSourceNode;
let hasAudioContextStarted = false;

const UP = "up";
const RIGHT = "right";
const LEFT = "left";
const DOWN = "down";

const sine = () =>
    Array.from(
        { length: paper.view.viewSize.width },
        (_, x) => new paper.Point(x, Math.sin(x / 15) / 2)
    );

const flat = () =>
    Array.from(
        { length: paper.view.viewSize.width },
        (_, x) => new paper.Point(x, 0)
    );

const noise = () =>
    Array.from(
        { length: paper.view.viewSize.width },
        (_, x) => new paper.Point(x, (Math.random() * 2 - 1) / 2)
    );

const paperCanvas = (canvas: HTMLCanvasElement) => {
    paper.setup(canvas);
    const tool = new paper.Tool();

    startX = paper.view.viewSize.width / 5;
    endX = (paper.view.viewSize.width / 5) * 2;

    const instructionText = new paper.PointText({
        point: new paper.Point(
            paper.view.viewSize.width / 50,
            paper.view.viewSize.height / 10
        ),
        content:
            "Interact with the canvas to draw new waveforms.\nUse the arrow keys to move the sample slice",
        justification: "left",
        fontSize: 15,
    });

    const path = new paper.Path({ strokeColor: "black" });
    let startLinePath = new paper.Path.Line(
        new paper.Point(startX, 0),
        new paper.Point(startX, paper.view.viewSize.height)
    );
    startLinePath.strokeColor = new paper.Color("red");

    let endLinePath = new paper.Path.Line(
        new paper.Point(endX, 0),
        new paper.Point(endX, paper.view.viewSize.height)
    );
    endLinePath.strokeColor = new paper.Color("red");

    const drawSegmentsFromPoints = (points: paper.Point[]) => {
        path.removeSegments();
        points.forEach((point) => (waveform[point.x] = point));
        waveform.forEach((point) =>
            path.add(
                new paper.Point(
                    point.x,
                    map(point.y, -1, 1, 0, paper.view.viewSize.height)
                )
            )
        );
    };

    tool.onKeyDown = (event: paper.KeyEvent) => {
        const speed = 3;
        if (event.key === RIGHT) {
            startX += speed;
            endX += speed;
        } else if (event.key === LEFT) {
            startX -= speed;
            endX -= speed;
        } else if (event.key === UP) {
            startX -= speed;
            endX += speed;
        } else if (event.key === DOWN) {
            startX += speed;
            endX -= speed;
        }
        if (startX < 0) startX = 0;
        if (endX > paper.view.viewSize.width) endX = paper.view.viewSize.width;
        if (startX >= endX + speed) startX = endX - speed;
        if (endX <= startX + speed) endX = startX + speed;

        // TODO: feels unneccessary to remove and redraw everything
        startLinePath.removeSegments();
        startLinePath = new paper.Path.Line(
            new paper.Point(startX, 0),
            new paper.Point(startX, paper.view.viewSize.height)
        );
        startLinePath.strokeColor = new paper.Color("red");

        endLinePath.removeSegments();
        endLinePath = new paper.Path.Line(
            new paper.Point(endX, 0),
            new paper.Point(endX, paper.view.viewSize.height)
        );
        endLinePath.strokeColor = new paper.Color("red");
        beep();
    };

    tool.onKeyUp = (event: paper.KeyEvent) => {
        if ([UP, RIGHT, DOWN, LEFT].includes(event.key)) {
            beep();
            if (instructionText) {
                instructionText.visible = false;
            }
        }
    };

    let points: Array<paper.Point> = [];
    paper.view.onMouseDown = (event: paper.MouseEvent) => (points = []);

    paper.view.onMouseDrag = (event: paper.ToolEvent) => {
        // TODO: manual smoothing of points that are in between,
        // i.e. smooth idx 2 for points with x values [0, 1, 3, 5]
        points.push(event.point);
        const normalizedPoints = points.map(
            (point) =>
                new paper.Point(
                    point.x,
                    map(point.y, 0, paper.view.viewSize.height, -1, 1)
                )
        );
        drawSegmentsFromPoints(normalizedPoints);
    };

    paper.view.onMouseUp = (event: paper.MouseEvent) => {
        // path.simplify();
        // path.smooth({ type: "continuous" });
        beep();
    };

    drawSegmentsFromPoints(sine());

    // connect all the buttons
    const connectButtonIdToWaveshaper = (
        id: string,
        waveformShaper: () => paper.Point[]
    ) => {
        const button = document.getElementById(id);
        button.addEventListener("click", () => {
            drawSegmentsFromPoints(waveformShaper());
            beep();
        });
    };
    connectButtonIdToWaveshaper("sine", sine);
    connectButtonIdToWaveshaper("noise", noise);
    connectButtonIdToWaveshaper("flat", flat);

    const button = document.getElementById("help");
    button.addEventListener("click", () => {
        if (instructionText) {
            instructionText.visible = !instructionText.visible;
        }
    });

    const playButton = document.querySelector("#play");
    if (playButton) {
        playButton.addEventListener("click", () => {
            if (!hasAudioContextStarted) {
                audioCtx = new window.AudioContext({ sampleRate: sampleRate });
                hasAudioContextStarted = true;
                console.log("AudioContext started");
                beep();
            }
        });
    }
};

const beep = () => {
    if (!hasAudioContextStarted) return;
    if (audioSource) {
        audioSource.stop();
    }

    audioSource = audioCtx.createBufferSource();

    audioSource.onended = () => {
        console.log("AudioSource finished", new Date().toLocaleString("no-NO"));
    };

    const durationSeconds = 1;
    const channels = 1;

    let frameCount = audioCtx.sampleRate * durationSeconds;
    let audioBuffer = audioCtx.createBuffer(
        channels,
        frameCount,
        audioCtx.sampleRate
    );

    const samples = waveform.map((point) => point.y).slice(startX, endX);
    // const mirroredSamples = samples.concat([...samples].reverse());
    for (let channel = 0; channel < channels; channel++) {
        let nowBuffering = audioBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            nowBuffering[i] = samples[i % samples.length];
        }
    }

    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(1.0, now + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.0, now + audioBuffer.duration);

    audioSource.loop = false;
    audioSource.buffer = audioBuffer;
    audioSource.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    audioSource.start();
};

const printViewDimensions = () => {
    console.log(
        "W x H:",
        paper.view.viewSize.width,
        "x",
        paper.view.viewSize.height
    );
};

const map = (
    value: number,
    a: number,
    b: number,
    c: number,
    d: number
): number => ((value - a) * (d - c)) / (b - a) + c;

export default paperCanvas;
