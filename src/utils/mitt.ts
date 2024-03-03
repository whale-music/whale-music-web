import type { Emitter } from "mitt";
import mitt from "mitt";

type Events = {
  resize: {
    detail: {
      width: number;
      height: number;
    };
  };
  library: {
    page: {
      current?: number;
      size?: number;
    };
  };
  openPanel: string;
  tagViewsChange: string;
  tagViewsShowModel: string;
  logoChange: boolean;
  changLayoutRoute: {
    indexPath: string;
    parentPath: string;
  };
  openPlayMusic: string;
  closePlayMusic: string;
};

export const emitter: Emitter<Events> = mitt<Events>();
