// import { http } from "@/utils/http";

export const getAsyncRoutes = () => {
  const permissionRouter = {
    path: "/permission",
    meta: {
      title: "menus.permission",
      icon: "lollipop",
      rank: 10
    },
    children: [
      {
        path: "/permission/page/index",
        name: "PermissionPage",
        meta: {
          title: "menus.permissionPage",
          roles: ["admin", "common"]
        }
      },
      {
        path: "/permission/button/index",
        name: "PermissionButton",
        meta: {
          title: "menus.permissionButton",
          roles: ["admin", "common"],
          auths: ["btn_add", "btn_edit", "btn_delete"]
        }
      }
    ]
  };
  // return http.request<Result>("get", "/getAsyncRoutes");
  return new Promise(resolve => {
    resolve({
      success: true,
      data: [permissionRouter]
    });
  });
};
