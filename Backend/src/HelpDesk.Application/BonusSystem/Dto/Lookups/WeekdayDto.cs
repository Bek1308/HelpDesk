using System;

namespace HelpDesk.BonusSystem.Lookups.Dtos
{
    public class WeekdayDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public long? CreatorUserId { get; set; }
        public string CreatorUserName { get; set; }
        public int? TenantId { get; set; }
    }
}