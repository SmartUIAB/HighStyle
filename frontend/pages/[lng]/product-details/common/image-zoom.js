import React from "react";
import { Media } from "reactstrap";

export default function ImageZoom({ image }) {
  if (!image) return null;
  const src = typeof image === "string" ? image : image.src;
  if (!src) return null;
  return <Media src={src} alt={typeof image === "string" ? "Product image" : (image.alt || "Product image")} className="img-fluid image_zoom_cls-0" />;
}
