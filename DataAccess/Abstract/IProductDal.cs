using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;

namespace DataAccess.Abstract
{
    public interface IProductDal:IEntityRepository<Product>
    {
        Task<List<ProductDetailDto>> GetProductDetails();
        Task<List<ProductDto>> GetProductsWithCategoryName();
        Task<List<Product>> SearchByNameAsync(string search, int take = 50, CancellationToken ct = default);
    }
}
