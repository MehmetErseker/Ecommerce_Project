using Core.Utilities.Results;
using Entities.Concrete;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IAddressService
    {
        Task<IDataResult<List<Address>>> GetAll();
        Task<IResult> Add(Address address);
        Task<IResult> Delete(int addressId);
        Task<IResult> Update(Address address);
        Task<IDataResult<Address>> GetById(int addressId);
    }
}
