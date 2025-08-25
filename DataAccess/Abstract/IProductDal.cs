using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;

namespace DataAccess.Abstract
{
    public interface IProductDal:IEntityRepository<Product>
    {
        Task<List<ProductDetailDto>> GetProductDetails();
        Task<List<ProductDto>> GetProductsWithCategoryName();
    }
}
