using TaskManager.Domain.Entities;

namespace TaskManager.Application.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Category?> GetByIdAndUserIdAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default);
    Task UpdateAsync(Category category, CancellationToken cancellationToken = default);
    Task DeleteAsync(Category category, CancellationToken cancellationToken = default);
}
