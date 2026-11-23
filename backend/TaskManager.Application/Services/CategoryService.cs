using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        List<Category> categories = await _categoryRepository.GetAllAsync(cancellationToken);
        List<CategoryDto> dtos = categories.Select(c => new CategoryDto(
            c.Id,
            c.Name,
            c.Color
        )).ToList();

        return dtos;
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        Category? category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            return null;
        }

        return new CategoryDto(category.Id, category.Name, category.Color);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        Category newCategory = new Category
        {
            Name = dto.Name,
            Color = dto.Color
        };

        Category createdCategory = await _categoryRepository.AddAsync(newCategory, cancellationToken);
        return new CategoryDto(createdCategory.Id, createdCategory.Name, createdCategory.Color);
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        Category? existingCategory = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (existingCategory == null)
        {
            return null;
        }

        existingCategory.Name = dto.Name;
        existingCategory.Color = dto.Color;

        await _categoryRepository.UpdateAsync(existingCategory, cancellationToken);
        return new CategoryDto(existingCategory.Id, existingCategory.Name, existingCategory.Color);
    }

    public async Task<bool> DeleteCategoryAsync(int id, CancellationToken cancellationToken = default)
    {
        Category? existingCategory = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (existingCategory == null)
        {
            return false;
        }

        await _categoryRepository.DeleteAsync(existingCategory, cancellationToken);
        return true;
    }
}
