using Core.Entities;

namespace Entities.DTOs
{
    public class ProductDto:IDto
    {
        public string Name { get; set; }
        public int CategoryId { get; set; }
        public decimal UnitPrice { get; set; }
        public int UnitsInStock { get; set; }
    }
}
