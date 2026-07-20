import type { FormatPlugin } from "../../core/formats/FormatPlugin";
import CrngViewer from "./CrngViewer";
import BodyViewer from "./BodyViewer";
import IlbmViewer from "./IlbmViewer";
import CmapViewer from "./CmapViewer";
import BmhdViewer from "./BmhdViewer";

const ilbmPlugin: FormatPlugin = {
  name: "Interleaved Bitmap",
  supportedTypes: ["ILBM"],
  fileViewer: IlbmViewer,
  chunkViewers: {
    BMHD: BmhdViewer,
    CMAP: CmapViewer,
    BODY: BodyViewer,
    CRNG: CrngViewer,
  },
};

export default ilbmPlugin;
