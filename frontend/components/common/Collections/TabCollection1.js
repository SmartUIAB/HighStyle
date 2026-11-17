import React from "react";
import LiveCatalog from "./LiveCatalog";

// Show actual digital products rather than hard-coded template category tabs.
export default function TabCollection() {
  return <LiveCatalog kind="digital" title="Digital products" subtitle="Explore the available collection" />;
}
