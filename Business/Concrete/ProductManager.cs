using AutoMapper;
using Business.Abstract;
using Business.BusinessAspects.Autofac;
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
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class ProductManager : IProductService
    {
        IProductDal _productDal;
        IMapper _mapper;

        public ProductManager(IProductDal productDal, IMapper mapper)
        {
            _productDal = productDal;
            _mapper = mapper;
        }

        //[SecuredOperation("product.add,admin")]
        [ValidationAspect(typeof(ProductValidator))]
        public async Task<IResult> Add(ProductDto productDto)
        {
            var productEntity = _mapper.Map<Product>(productDto);
            await _productDal.Add(productEntity);
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
            var products = await _productDal.GetAll();
            return new SuccessDataResult<List<Product>>(products, Messages.ProductsListed);
            //dto kısmı eklenecek
            //var productsDto = await _productDal.GetProductsWithCategoryName();
            //return new SuccessDataResult<List<ProductDto>>(productsDto, Messages.ProductsListed);
        }

        public async Task<IDataResult<Product>> GetById(int productId)
        {
   
            return new SuccessDataResult<Product>(await _productDal.Get(p => p.Id == productId));
        }

        public async Task<IDataResult<List<Product>>> GetByName(string productName)
        {
            if (string.IsNullOrWhiteSpace(productName) || productName.Trim().Length < 2)
                return new ErrorDataResult<List<Product>>(Messages.ProductNotFound);

            var list = await _productDal.SearchByNameAsync(productName, take: 50);
            return list.Any()
                ? new SuccessDataResult<List<Product>>(list, Messages.ProductsListed)
                : new ErrorDataResult<List<Product>>(Messages.ProductNotFound);
        }



        public async Task<IResult> Update(Product product)
        {
            await _productDal.Update(product);
            return new SuccessResult(Messages.ProductUpdated);
        }

    }
}
