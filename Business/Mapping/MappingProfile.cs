using AutoMapper;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            //CreateMap<User, UserAddressDto>();

            CreateMap<Address, AddressDto>().ReverseMap();

            // Product -> ProductDto
            CreateMap<Product, ProductDto>().ReverseMap();

            // Product -> ProductInCategoryDto
            CreateMap<Product, ProductInCategoryDto>();

            // Category -> CategoryDto
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.Products, opt => opt.MapFrom(src => src.Products));

            CreateMap<CategoryDto, Category>()
                .ForMember(dest => dest.Products, opt => opt.Ignore());

            CreateMap<Cart, CartDto>().ReverseMap();

            CreateMap<CartItem, CartItemDto>().ReverseMap();

            CreateMap<Order, OrderDto>().ReverseMap();

            CreateMap<OrderDetail, OrderDetailDto>().ReverseMap();

        }
    }
}
