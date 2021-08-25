import paper from "paper";

let waveform: Array<paper.Point> = [];
const sampleRate = 22050;
let audioCtx: AudioContext;
let audioSource: AudioBufferSourceNode;
let hasAudioContextStarted = false;

const sine = () =>
    Array.from(
        { length: paper.view.viewSize.width },
        (_, x) => new paper.Point(x, Math.sin(x / 10))
    );

const flat = () =>
    Array.from(
        { length: paper.view.viewSize.width },
        (_, x) => new paper.Point(x, 0)
    );

const noise = () =>
    Array.from(
        { length: paper.view.viewSize.width },
        (_, x) => new paper.Point(x, Math.random())
    );

const paperCanvas = (canvas: HTMLCanvasElement) => {
    paper.setup(canvas);
    const path = new paper.Path({ strokeColor: "black" });

    const drawSegmentsFromPoints = (points: paper.Point[]) => {
        path.removeSegments();
        points.forEach((point) => (waveform[point.x] = point));
        waveform.forEach((point) =>
            path.add(
                point
                    .multiply(new paper.Point(1, 10))
                    .add(
                        new paper.Point(
                            0,
                            Math.round(paper.view.viewSize.height / 2)
                        )
                    )
            )
        );
    };

    let points: Array<paper.Point> = [];
    paper.view.onMouseDown = (event: paper.MouseEvent) => (points = []);

    paper.view.onMouseDrag = (event: paper.ToolEvent) => {
        points.push(event.point);
        const normalizedPoints = points.map(
            (point) =>
                new paper.Point(
                    point.x,
                    map(point.y, 0, paper.view.viewSize.height, -10, 10)
                )
        );
        drawSegmentsFromPoints(normalizedPoints);
    };

    paper.view.onMouseUp = (event: paper.MouseEvent) => {
        beep();
    };

    drawSegmentsFromPoints(noise());

    // set up buttons
    const clearButton = document.querySelector("#clear");
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            drawSegmentsFromPoints(sine());
            beep();
        });
    }
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

    const samples = waveform.map((point) => point.y);
    const mirroredSamples = samples.concat([...samples].reverse());
    for (let channel = 0; channel < channels; channel++) {
        let nowBuffering = audioBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            nowBuffering[i] = mirroredSamples[i % mirroredSamples.length];
        }
    }

    audioSource.loop = true;
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioCtx.destination);
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
