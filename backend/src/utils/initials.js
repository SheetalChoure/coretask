/**
 * "Priya Nair" -> "PN". Used whenever we embed a lightweight user summary
 * (owner, project members, task assignee) in an API response, so the
 * frontend can render an <Avatar> without a second round trip.
 */
function initialsFromName(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

module.exports = { initialsFromName };
