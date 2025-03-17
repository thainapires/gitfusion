//This is a workaround to show the dates correctly in the graph, for some reason the react calendar lib is not showing it correctly
export const shiftDateForward = (date: string) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1); // Shift the date forward by one day
    return currentDate.toISOString().split('T')[0]; // Return the date in YYYY-MM-DD format
};