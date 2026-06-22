import { computed } from "vue";
import { useRoute } from "vue-router";

export function useEditMode() {
  const route = useRoute();

  const isEditMode = computed(() => route.query.mode === "edit");

  const editDate = computed(() => route.query.date || "");

  const editDeclarantId = computed(() => route.query.declarant_id || "");

  return { isEditMode, editDate, editDeclarantId };
}
