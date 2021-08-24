import paper from "paper";

let points: paper.Point[] = [];

const paperCanvas = (canvas: HTMLCanvasElement) => {
    paper.setup(canvas);
    const path = new paper.Path({ strokeColor: "black" });
    const mirrorPath = new paper.Path({ strokeColor: "pink" });
    let start: paper.Path.Line, end: paper.Path.Line;

    const drawSegmentsFromPoints = (points: paper.Point[]) => {
        const firstPointX = points[0].x;
        const lastPointX = points[points.length - 1].x;

        points.forEach((point, idx) => {
            path.add(point);
            mirrorPath.add(
                new paper.Point(
                    point.x + (lastPointX - firstPointX),
                    points[points.length - 1 - idx].y
                )
            );
        });

        start = new paper.Path.Line(
            new paper.Point(firstPointX, 0),
            new paper.Point(firstPointX, canvas.height)
        );
        start.strokeColor = new paper.Color("red");

        end = new paper.Path.Line(
            new paper.Point(lastPointX, 0),
            new paper.Point(lastPointX, canvas.height)
        );
        end.strokeColor = new paper.Color("red");
    };
    paper.view.onMouseDown = (event: paper.MouseEvent) => {
        points = [];
        path.removeSegments();
        mirrorPath.removeSegments();
        if (start && end) {
            start.removeSegments();
            end.removeSegments();
        }
    };

    paper.view.onMouseDrag = (event: paper.ToolEvent) => {
        points.push(event.point);
    };

    paper.view.onMouseUp = (event: paper.MouseEvent) => {
        drawSegmentsFromPoints(points);
    };

    beep();
};

const beep = () => {
    const button = document.querySelector("button");
    if (button) {
        button.addEventListener("click", function () {
            const durationSeconds = 1;
            const channels = 1;
            const sampleRate = 22050;
            let audioCtx = new window.AudioContext({ sampleRate: sampleRate });
            let frameCount = audioCtx.sampleRate * durationSeconds;
            let audioBuffer = audioCtx.createBuffer(
                channels,
                frameCount,
                audioCtx.sampleRate
            );

            /*
            TODO

            1. loop the waveshape for as long as it's natural to do it 
                (based on sampleRate and for how many seconds it's supposed to play (1 sec as MVP))
            2. play back the looped version
 
            */

            for (let channel = 0; channel < channels; channel++) {
                let nowBuffering = audioBuffer.getChannelData(channel);
                for (let i = 0; i < frameCount; i++) {
                    // TODO: interpolate somewhere
                    // nowBuffering[i] = samples[i];
                    nowBuffering[i] = Math.sin(Math.floor(i / 10)) - 0.5;
                }
            }

            let audioSource = audioCtx.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioCtx.destination);
            // audioSource.start();

            audioSource.onended = () => {
                console.log("White noise finished");
            };
        });
    } else {
        console.warn(
            "No button element found to use to activate the audio context"
        );
    }
};

const resample = (samples: []): [] => {
    // TODO: resample values in a list of samples to fit the desired range
    // see inspo from numpy or scipy?
    return [];
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
