using Business.Abstract;
using Business.Constants;
using Business.ValidationRules.FluentValidation;
using Core.Aspects.Autofac.Validation;
using Core.CrossCuttingConcerns.Validation;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using Entities.DTOs;
using FluentValidation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class ProductManager : IProductService
    {
        IProductDal _productDal;

        public ProductManager(IProductDal productDal)
        {
            _productDal = productDal;
        }

        [ValidationAspect(typeof(ProductValidator))]
        public async Task<IResult> Add(Product product)
        {

            await _productDal.Add(product);
            return new SuccessResult(Messages.ProductAdded);
        }

        public async Task<IResult> Delete(int productId)
        {
            var entity = await _productDal.Get(u => u.Id == productId);
            if (entity == null)
            {
                return new ErrorResult(Messages.ProductNotFound);
            }

            await _productDal.Delete(entity);
            return new SuccessResult(Messages.ProductDeleted);
        }

        public async Task<IDataResult<List<Product>>> GetAll()
        {

            return new SuccessDataResult<List<Product>>(await _productDal.GetAll(), Messages.ProductsListed);
        }

        public async Task<IDataResult<List<Product>>> GetAllByCategoryId(int id)
        {
            return new SuccessDataResult<List<Product>>(await _productDal.GetAll(p => p.CategoryId == id));
        }

        public async Task<IDataResult<Product>> GetById(int productId)
        {
            return new SuccessDataResult<Product>(await _productDal.Get(p => p.Id == productId));
        }

        public async Task<IDataResult<List<Product>>> GetByUnitPrice(decimal min, decimal max)
        {
            return new SuccessDataResult<List<Product>>(await _productDal.GetAll(p => p.UnitPrice >= min && p.UnitPrice <= max));
        }

        public async Task<IDataResult<List<ProductDetailDto>>> GetProductDetails()
        {
            return new SuccessDataResult<List<ProductDetailDto>>(await _productDal.GetProductDetails());
        }

        public async Task<IResult> Update(Product product)
        {
            await _productDal.Update(product);
            return new SuccessResult(Messages.ProductUpdated);
        }
    }
}
