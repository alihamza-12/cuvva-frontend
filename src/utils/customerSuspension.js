export const requestSuspensionDays = () => {
  const answer = window.prompt(
    "How many days should this customer be suspended? Enter a number from 1 to 3650.",
    "7",
  );
  if (answer === null) return null;
  const days = Number(answer);
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    window.alert("Enter a whole number between 1 and 3650 days.");
    return null;
  }
  return days;
};

export const getSuspensionSummary = (customer) => {
  if (customer?.status !== "Suspended") return "";
  const until = customer.suspendedUntil
    ? new Date(customer.suspendedUntil).toLocaleString()
    : "No end date";
  const by = customer.suspendedBy?.fullName || "Unknown administrator";
  return `Until ${until} · By ${by}`;
};
