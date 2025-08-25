using Core.Entities;

namespace Entities.DTOs
{
    public class ProductDto:IDto
    {
        public string Name { get; set; }
        public string CategoryName { get; set; }
        public decimal UnitPrice { get; set; }
        public int UnitsInStock { get; set; }
    }
}
