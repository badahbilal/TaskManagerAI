namespace TaskManager.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public List<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
