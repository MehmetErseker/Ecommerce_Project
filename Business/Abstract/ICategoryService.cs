using Core.Utilities.Results;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface ICategoryService
    {
        Task<IDataResult<List<Category>>> GetAll();
        Task<IResult> Add(Category category);
        Task<IResult> Delete(int categoryId);
        Task<IResult> Update(Category category);
        Task<Category> GetById(int categoryId);
        //IDataResult<List<Category>> GetAllWithProducts();
    }
}
