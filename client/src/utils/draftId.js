// One anonymous draft identity per browser per form — no auth system
// exists yet, so this is what "returning later" means for now: same
// browser, same localStorage. Good enough for Week 4's actual goal
// (prove save/resume works); a real account system would replace this.
export function getDraftId(formId) {
  const key = `forma-ai-draft-id:${formId}`;
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
