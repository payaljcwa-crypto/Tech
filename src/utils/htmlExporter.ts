/**
 * Utility to download the self-contained standalone HTML Tool
 * Allows users to run the P&L Dashboard independently by double-clicking a single file in any browser.
 */

export async function downloadStandaloneHtml() {
  try {
    const res = await fetch('./sub_regional_pnl_dashboard.html');
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sub_regional_pnl_dashboard.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
  } catch (err) {
    console.warn('Direct fetch failed, attempting absolute path fallback', err);
  }

  // Fallback if needed
  try {
    const res = await fetch('/sub_regional_pnl_dashboard.html');
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sub_regional_pnl_dashboard.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
  } catch (e) {
    console.error('Failed to download standalone HTML file', e);
  }
}
