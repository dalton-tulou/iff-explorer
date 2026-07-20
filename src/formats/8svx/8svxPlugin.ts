import type { FormatPlugin } from "../../core/formats/FormatPlugin";
import BodyViewer from "./BodyViewer";
import ChanViewer from "./ChanViewer";
import TextViewer from "./textViewer";
import VhdrViewer from "./vhdrViewer";

const svxPlugin: FormatPlugin = {
  name: "8SVX",
  supportedTypes: ["8SVX"],
  chunkViewers: {
    VHDR: VhdrViewer,
    NAME: TextViewer,
    ANNO: TextViewer,
    "(c)J": TextViewer,
    CHAN: ChanViewer,
    BODY: BodyViewer,
  },
};

export default svxPlugin;
