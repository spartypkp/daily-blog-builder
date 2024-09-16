import matplotlib.pyplot as plt

# Data setup
months = ['Month 0', 'Month 1', 'Month 3', 'Month 6', 'Month 12']
values = [0, 20, 50, 100, 200]


# Creating the plot
fig, ax = plt.subplots()
ax.plot(months, values, marker='o', linestyle='-', color='b')

# Adding a title and labels
plt.title("Projected Shareholder Value After Hiring Will")
plt.xlabel("Time (Months After Hiring)")
plt.ylabel("Shareholder Value (% Increase)")



# Adding a humorous touch
plt.figtext(0.5, 0.01, "Caution: Graph scale may need adjusting if Will continues like this.", ha="center", fontsize=8, color='red')

# Show plot
plt.show()