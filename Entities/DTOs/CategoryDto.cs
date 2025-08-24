using Core.Entities;
using Entities.Concrete;

namespace Entities.DTOs
{
    public class CategoryDto:IDto
    {
        public string Name { get; set; }
        public List<ProductInCategoryDto> Products { get; set; }
    }
}
