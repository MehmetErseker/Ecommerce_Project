using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class CategoryManager : ICategoryService
    {
        private readonly ICategoryDal _categoryDal;

        public CategoryManager(ICategoryDal categoryDal)
        {
            _categoryDal = categoryDal;
        }

        public async Task<IResult> Add(Category category)
        {
            await _categoryDal.Add(category);
            return new SuccessResult(Messages.CategoryAdded);
        }

        public async Task<IResult> Delete(int categoryId)
        {
            var category = await _categoryDal.Get(c => c.Id == categoryId);
            if (category == null)
            {
                return new ErrorResult(Messages.CategoryNotFound);
            }

            await _categoryDal.Delete(category);
            return new SuccessResult(Messages.CategoryDeleted);
        }

        public async Task<Category> GetById(int categoryId)
        {
            return await _categoryDal.Get(c => c.Id == categoryId);
        }

        public async Task<IResult> Update(Category category)
        {
            await _categoryDal.Update(category);
            return new SuccessResult(Messages.CategoryUpdated);
        }

        public async Task<IDataResult<List<Category>>> GetAll()
        {
            var categories = await _categoryDal.GetAllWithProducts();
            return new SuccessDataResult<List<Category>>(categories, Messages.CategoriesListed);
        }
    }
}
