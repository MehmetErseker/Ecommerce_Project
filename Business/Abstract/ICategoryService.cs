using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface ICategoryService
    {
        Task<IDataResult<List<Category>>> GetAll();
        Task<IResult> Add(CategoryDto categoryDto);
        Task<IResult> Delete(int categoryId);
        Task<IResult> Update(Category category);
        Task<IDataResult<Category>> GetById(int categoryId);
    }
}
