using TaskManager.Application.DTOs;

namespace TaskManager.Application.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllCategoriesAsync(int userId, CancellationToken cancellationToken = default);
    Task<CategoryDto?> GetCategoryByIdAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto, int userId, CancellationToken cancellationToken = default);
    Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryDto dto, int userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteCategoryAsync(int id, int userId, CancellationToken cancellationToken = default);
}
