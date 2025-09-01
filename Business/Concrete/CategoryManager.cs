using AutoMapper;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using Entities.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class CategoryManager : ICategoryService
    {
        private readonly ICategoryDal _categoryDal;
        private readonly IMapper _mapper;

        public CategoryManager(ICategoryDal categoryDal, IMapper mapper)
        {
            _categoryDal = categoryDal;
            _mapper = mapper;
        }

        public async Task<IResult> Add(CategoryDto categoryDto)
        {
            var categoryEntity = _mapper.Map<Category>(categoryDto);
            await _categoryDal.Add(categoryEntity);
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

        public async Task<IDataResult<Category>> GetById(int categoryId)
        {
            var category = await _categoryDal.GetAllProductsInACategory(categoryId);
            if(category == null)
            {
                return new ErrorDataResult<Category>();
            }
            return new SuccessDataResult<Category>(category,Messages.CategoryListed);
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

            //dto eklenecek
            //var categories = await _categoryDal.GetAllWithProducts();
            //var categoriesDto = _mapper.Map<List<CategoryDto>>(categories);
            //return new SuccessDataResult<List<CategoryDto>>(categoriesDto, Messages.CategoriesListed);

        }
    }
}
