using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface ICategoryService
    {
        Task<IDataResult<List<CategoryDto>>> GetAll();
        Task<IResult> Add(CategoryDto categoryDto);
        Task<IResult> Delete(int categoryId);
        Task<IResult> Update(Category category);
        Task<Category> GetById(int categoryId);
        //IDataResult<List<Category>> GetAllWithProducts();
    }
}
