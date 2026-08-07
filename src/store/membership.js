import { defineStore } from "pinia";
import { ref } from "vue";
import request from "@/utils/request";

export const useMembershipStore = defineStore("membership", () => {
  const loading = ref(true);
  const membershipInfo = ref({ isMember: false, type: null, expireAt: null, daysLeft: 0 });
  const claimedFreeTrial = ref(false);
  const history = ref([]);
  const paidMembershipInfo = ref({ isPaidMember: false, type: null, expireAt: null, daysLeft: 0 });
  // 会员引导弹窗可见性（由路由守卫触发，全局弹窗组件消费）
  const gateVisible = ref(false);

  function openGate() {
    gateVisible.value = true;
  }

  function closeGate() {
    gateVisible.value = false;
  }

  async function fetchMembershipStatus() {
    loading.value = true;
    try {
      const res = await request.get("/api/membership/status");
      const data = res.data;
      if (data.success) {
        membershipInfo.value = data.membership;
        claimedFreeTrial.value = data.claimedFreeTrial;
        history.value = data.history || [];
        paidMembershipInfo.value = data.paidMembership || { isPaidMember: false, type: null, expireAt: null, daysLeft: 0 };

        // 同步到 localStorage
        localStorage.setItem("membershipStatus", JSON.stringify(data.membership));
      }
    } catch (err) {
      console.error("获取会员状态失败:", err);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    membershipInfo,
    claimedFreeTrial,
    paidMembershipInfo,
    history,
    gateVisible,
    openGate,
    closeGate,
    fetchMembershipStatus,
  };
});
