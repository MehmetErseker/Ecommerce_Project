using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IProductService
    {
        Task<IDataResult<List<Product>>> GetAll();

        //Task<IDataResult<List<Product>>> GetAllByCategoryId(int categoryId);

        //Task<IDataResult<List<Product>>> GetByUnitPrice(decimal min, decimal max);

        //Task<IDataResult<List<ProductDetailDto>>> GetProductDetails();

        Task<IDataResult<Product>> GetById(int productId);

        Task<IResult> Add(ProductDto productDto);

        Task<IResult> Delete(int productId);

        Task<IResult> Update(Product product);

        Task<IDataResult<List<Product>>> GetByName(string productName);

    }
}
