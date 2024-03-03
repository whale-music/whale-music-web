import { Directive, type DirectiveBinding } from "vue";

import { hasAuth } from "@/router/utils";

export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    if (value) {
      !hasAuth(value) && el.parentNode?.removeChild(el);
    } else {
      throw new Error("need auths! Like v-auth=\"['btn.add','btn.edit']\"");
    }
  }
};
