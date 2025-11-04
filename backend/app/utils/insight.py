class Insights:
    
    @staticmethod
    def calculate_expense_trends(expenses):
        """Calculate expense trends over time."""
        # Placeholder implementation
        trends = {}
        for expense in expenses:
            month = expense.date.strftime("%Y-%m")
            trends[month] = trends.get(month, 0) + expense.amount
        return trends