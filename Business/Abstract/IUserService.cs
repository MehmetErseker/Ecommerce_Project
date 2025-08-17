using Core.Utilities.Results;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IUserService
    {
        Task<IDataResult<List<User>>> GetAll();
        Task<IDataResult<List<User>>> GetAllUsers();
        Task<IResult> Add(User user);
        Task<IResult> Update(User user);
        Task<IResult> Delete(int UserId); //soft delete
        Task<IResult> HardDelete(int UserId);
    }
}
