import paper from "paper";

export default function newPaperCanvas() {
    // Get a reference to the canvas object
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    const path = new paper.Path();
    path.strokeColor = "black";
    var start = new paper.Point(100, 100);
    path.moveTo(start);
    path.lineTo(start.add([200, -50]));
    paper.view.draw();

    return canvas;
}
