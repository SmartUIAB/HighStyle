import React from "react";
import LiveCatalog from "./LiveCatalog";

// The original template queried an API operation that does not exist.
// Preserve the caller's props while rendering the real physical-product catalog.
export default function TopCollection({ title = "Featured fashion", subtitle, designClass }) {
  return <LiveCatalog kind="physical" title={title} subtitle={subtitle} designClass={designClass} />;
}
