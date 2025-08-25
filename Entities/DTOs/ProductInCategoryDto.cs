using Core.Entities;

namespace Entities.DTOs
{
    public class ProductInCategoryDto : IDto
    {
        public string Name { get; set; }
        public decimal UnitPrice { get; set; }
        public int UnitsInStock { get; set; }
    }
}
