import paper from "paper";

const paperCanvas = () => {
    const canvas = document.querySelector("canvas");
    const points = [];
    paper.setup(canvas);
    const path = new paper.Path();
    path.strokeColor = new paper.Color(0.8, 0.2, 0.0, 0.8);

    const width = paper.view.viewSize.width;
    const height = paper.view.viewSize.height;

    const start = new paper.Point(0, height / 2);
    path.moveTo(start);

    for (let x = 0; x < width; x++) {
        const newPoint = new paper.Point([
            x,
            Math.cos(Math.floor(x / 3)) * 0.1 * (height / 2),
        ]);
        points.push(newPoint);
        path.lineTo(start.add(newPoint));
    }

    document.querySelector('button').addEventListener('click', function() {
        // could sampleRate simply be the width of the window?
        // would yield very poor quality, but practical for first iterations
        const durationSeconds = 2.0;
        const channels = 1;
        const sampleRate = 22050;
        let audioCtx = new window.AudioContext({ sampleRate: sampleRate });
        let frameCount = audioCtx.sampleRate * durationSeconds;
        let myArrayBuffer = audioCtx.createBuffer(
            channels,
            frameCount,
            audioCtx.sampleRate
            );
            
            for (let channel = 0; channel < channels; channel++) {
                let nowBuffering = myArrayBuffer.getChannelData(channel);
                for (let i = 0; i < frameCount; i++) {
                    // TODO: interpolate somewhere
                    // nowBuffering[i] = points[i];
                    nowBuffering[i] = Math.sin(Math.floor(i / 10)) - 0.5;
                }
            }
            
            let audioSource = audioCtx.createBufferSource();
            audioSource.buffer = myArrayBuffer;
            audioSource.connect(audioCtx.destination);
            audioSource.start();
            
            audioSource.onended = () => {
                console.log("White noise finished");
            };
    });
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

export default paperCanvas;
