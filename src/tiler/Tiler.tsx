import React from "react";
import { getTilePath } from "./getTile";

const MAX_ZOOM = 3;

const VIEWPORT_SIZE = 500;

const Tiler: React.FC = () => {
  const [zoom, setZoom] = React.useState(1);
  const [isPanning, setPanning] = React.useState(false);
  const [origin, setOrigin] = React.useState([0, 0]);
  const [mouseAt, setMouseAt] = React.useState([0,0]);
  const [scale, setScale] = React.useState(1);
  // How many columns and rows there should be in the grid
  const levelGrids = [1, 2, 4, 8];
  // Amount to add to origin when zooming in and out for each level.
  // These values are not 100% correct and zoom approximately the right amount.
  const zoomLevels = [125, 250, 500, 0];

  const zoomIn = () => {
    setScale((scale) => scale + 0.2);
    setZoom((zoom) => zoom + 1);
    setOrigin(([originX, originY]) => [
      originX - zoomLevels[zoom],
      originY - zoomLevels[zoom],
    ]);
  };

  // TODO YVO: For some reason, the zoom value is incorrect when I call it here
  // and I need to manually minus 1. Why? Why is it not having the same issue when zooming in?
  const zoomOut = () => {
    setScale((scale) => scale - 0.2);
    setZoom((zoom) => zoom - 1);
    setOrigin(([originX, originY]) => [
      originX + zoomLevels[zoom - 1],
      originY + zoomLevels[zoom - 1],
    ]);
  };

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const isZoomingIn = event.deltaY > -1;

    // TODO YVO: fix this so it zooms where the mouse is rather than the center of the viewport.
    // The issue here is I don't understand how to use the mouseAt to calculate
    // the position of the mouse relative to the origin.
    // If you view the mouseAt val, it tells you at what grid point you are.
    // How do I get it to consider the origin here? Do I multiply it by pixels?
    // My main problem boils down to not completely understanding how the origin is
    // scaled across different levels.
    if (isZoomingIn && zoom !== MAX_ZOOM) {
      zoomIn();
    }

    if (!isZoomingIn && zoom !== 0) {
      zoomOut();
    }
  };

  const handleZoom = (movement: String) => {
    // Could've used Symbols to make this param more reliable during the checks below.
    // Thought it might have been overkill for this code challenge.
    if (movement === "in" && zoom !== MAX_ZOOM) {
      zoomIn();
    };

    if (movement === "out" && zoom !== 0) {
      zoomOut();
    };
  };

  const onPan = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isPanning) {
      return;
    }

    // event.movementX/Y - logs amount moved by mouse.
    // This func shows how much to move item depending on how much mouse has moved.
    setOrigin(([originX, originY]) => [
      originX + event.movementX,
      originY + event.movementY,
    ]);
  };

  // Updated this in order to display all images in the grid. I understand this may
  // impact performance on a larger dataset so I'd ideally have it do this on pan in that direction.
  // Did not do this now as it'd require some pretty intense code to have it render items
  // before they are panned to without impacting the image the user sees.

  // TODO YVO: Tiles are getting rendered strangely after updating this. Why?
  const rowsAndCols = [...Array(levelGrids[zoom])].map((_, i) => i);

  return (
    <div
      style={{
        width: VIEWPORT_SIZE,
        height: VIEWPORT_SIZE,
        cursor: `${isPanning ? 'grabbing' : 'grab' }`,
        background: "#0009",
        overflow: "hidden"
      }}
      onMouseDown={() => setPanning(true)}
      onMouseUp={() => setPanning(false)}
      onMouseMove={onPan}
      onMouseLeave={() => setPanning(false)}
    >
      <div
        onWheel={handleScroll}
        style={{
          display: "flex",
          flexDirection: "row",
          position: "relative",
          left: origin[0],
          top: origin[1],
          transition: "transform 0.5s",
          transform: `scale(${scale})`
        }}
        draggable={false}
      >
        {rowsAndCols.map((col) => (
          <div
            draggable={false}
            style={{ display: "flex", flexDirection: "column" }}

          >
            {rowsAndCols.map((row) => (
              <img
                draggable={false}
                src={getTilePath(zoom, col, row)}
                alt="1"
                onMouseOver={() => setMouseAt([col, row])}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{
        position: "absolute",
        left: VIEWPORT_SIZE - 50,
        top: VIEWPORT_SIZE - 70,
        display: "flex",
        flexDirection: "column"
      }}>
        <button type="button" onClick={() => handleZoom("in")} style={{
          background: "#f2f2f2",
          border: "none",
          width: "24px",
          height: "24px",
          cursor: "pointer",
          borderBottom: "solid 1px #808080"
        }}>
            +
        </button>
        <button type="button" onClick={() => handleZoom("out")} style={{
          background: "#f2f2f2",
          border: "none",
          width: "24px",
          height: "24px",
          cursor: "pointer"
        }}>
          -
        </button>
      </div>
    </div>
  );
};

export default Tiler;
