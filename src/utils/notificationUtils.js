export const checkSelfInteraction = (userInteractedId, recipeOwnerId) => {
  if (userInteractedId.toString() === recipeOwnerId.toString()) {
    console.log("User interacted with their own post. No notification needed.");
    return true;
  }
  return false;
};
