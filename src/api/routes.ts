// import { http } from "@/utils/http";

// type Result = {
//   success: boolean;
//   data: Array<any>;
// };

// export const getAsyncRoutes = () => {
//   const permissionRouter = {
//     path: "/permission",
//     meta: {
//       title: "menus.permission",
//       icon: "lollipop",
//       rank: 10
//     },
//     children: [
//       {
//         path: "/permission/page/index",
//         name: "PermissionPage",
//         meta: {
//           title: "menus.permissionPage",
//           roles: ["admin", "common"]
//         }
//       },
//       {
//         path: "/permission/button/index",
//         name: "PermissionButton",
//         meta: {
//           title: "menus.permissionButton",
//           roles: ["admin", "common"],
//           auths: ["btn_add", "btn_edit", "btn_delete"]
//         }
//       }
//     ]
//   };
//   // return http.request<Result>("get", "/getAsyncRoutes");
//   return new Promise((resolve, reject) => {
//     resolve({
//       success: true,
//       data: [permissionRouter]
//     });
//   });
// };
