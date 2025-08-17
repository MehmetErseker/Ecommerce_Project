using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IProductService
    {
        Task<IDataResult<List<Product>>> GetAll();

        Task<IDataResult<List<Product>>> GetAllByCategoryId(int id);

        Task<IDataResult<List<Product>>> GetByUnitPrice(decimal min, decimal max);

        Task<IDataResult<List<ProductDetailDto>>> GetProductDetails();

        Task<IDataResult<Product>> GetById(int productId);

        Task<IResult> Add(Product product);

        Task<IResult> Delete(int productId);

        Task<IResult> Update(Product product);

    }
}
