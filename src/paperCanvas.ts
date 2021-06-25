import paper from "paper";


const paperCanvas = (canvas : HTMLCanvasElement) => {
    let points = [];
    paper.setup(canvas);
    const path = new paper.Path({ strokeColor : 'black'});

    const drawSegmentsFromPoints = (points : paper.Point[]) => {
        points.forEach((point) => {
            path.add(point);
        })
    }
    paper.view.onMouseDown = (event: paper.MouseEvent) => {
        points = [];
        path.removeSegments()
    }

    paper.view.onMouseDrag = (event : paper.ToolEvent) => {
        points.push(event.point)
    }

    paper.view.onMouseUp = (event: paper.MouseEvent) => {
        drawSegmentsFromPoints(points)
    }

    beep()
};


const beep = () => {
    const button = document.querySelector('button');
    if (button) {    
        button.addEventListener('click', function() {
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
    } else {
        console.warn("No button element found to use to activate the audio context")
    }
}


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
